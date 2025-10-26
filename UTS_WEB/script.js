$(document).ready(function() {
    
    function loadOrders() {
        $.ajax({
            type: 'GET',
            url: 'process.php',
            success: function(response) {
                $('#results').html(response);
                updateBulkActionUI();
                $('.order-entry').each(function(i) {
                    $(this).delay(50 * i).fadeIn(400);
                });
            }
        });
    }

    function updateBulkActionUI() {
        const totalCheckboxes = $('.order-checkbox').length;
        const checkedCount = $('.order-checkbox:checked').length;

        if (totalCheckboxes > 0) {
            $('#bulk-action-container').fadeIn(200);
        } else {
            $('#bulk-action-container').fadeOut(200);
        }

        if (checkedCount > 0 && checkedCount === totalCheckboxes) {
            $('#selectAll').prop('checked', true);
        } else {
            $('#selectAll').prop('checked', false);
        }
    }

    loadOrders();

    $('#laundryForm').on('submit', function(event) {
        event.preventDefault();
        let isValid = true;
        $('.error-message').hide().text('');

        if ($('#nama').val().trim() === '') {
            $('#nama').next('.error-message').text('Nama pelanggan tidak boleh kosong.').show();
            isValid = false;
        }
        if ($('#telepon').val().trim() === '') {
            $('#telepon').next('.error-message').text('Nomor telepon tidak boleh kosong.').show();
            isValid = false;
        }
        if ($('#berat').val() === '' || parseFloat($('#berat').val()) <= 0) {
            $('#berat').next('.error-message').text('Berat harus lebih dari 0.').show();
            isValid = false;
        }
        if ($('input[name="layanan"]:checked').length === 0) {
            $('input[name="layanan"]').closest('.radio-group').next('.error-message').text('Silakan pilih jenis layanan.').show();
            isValid = false;
        }
        if ($('input[name="status"]:checked').length === 0) {
            $('input[name="status"]').closest('.radio-group').next('.error-message').text('Silakan pilih status pesanan.').show();
            isValid = false;
        }

        if (isValid) {
            const formData = $(this).serialize() + '&action=add';
            $('#submitBtn').prop('disabled', true).text('Memproses...');
            $.ajax({
                type: 'POST',
                url: 'process.php',
                data: formData,
                success: function(response) {
                    $('#results').html(response);
                    $('#laundryForm')[0].reset();
                    updateBulkActionUI();
                    $('.order-entry').fadeIn(400);
                },
                complete: function() {
                    $('#submitBtn').prop('disabled', false).text('Tambah Pesanan');
                }
            });
        }
    });

    $('#results').on('click', '.btn-selesai', function() {
        const orderId = $(this).data('id');
        $.ajax({
            type: 'POST',
            url: 'process.php',
            data: { action: 'update_status', id: orderId },
            success: function() {
                loadOrders();
            }
        });
    });

    $('#selectAll').on('change', function() {
        $('.order-checkbox').prop('checked', $(this).prop('checked'));
    });

    $('#results').on('change', '.order-checkbox', function() {
        updateBulkActionUI();
    });

    $('#bulkUpdateBtn').on('click', function() {
        const selectedCheckboxes = $('.order-checkbox:checked');
        const idsToUpdate = [];
        if (selectedCheckboxes.length === 0) {
            alert('Silakan pilih setidaknya satu pesanan untuk diubah.');
            return;
        }
        selectedCheckboxes.each(function() {
            const status = $(this).closest('.order-entry').data('status');
            if (status === 'Pending') {
                idsToUpdate.push($(this).data('id'));
            }
        });
        if (idsToUpdate.length === 0) {
            alert('Semua pesanan yang Anda pilih sudah berstatus Selesai.');
        } else {
            $.ajax({
                type: 'POST',
                url: 'process.php',
                data: { action: 'bulk_update_status', ids: idsToUpdate },
                success: function() {
                    loadOrders();
                }
            });
        }
    });

    $('#results').on('click', '.btn-edit', function() {
        const entry = $(this).closest('.order-entry');
        const orderId = entry.data('id');
        const nama = entry.find('[data-property="nama"]').text();
        const telepon = entry.find('[data-property="telepon"]').text();
        const layanan = entry.find('[data-property="layanan"]').text();
        const berat = entry.find('[data-property="berat"]').text();
        const status = entry.data('status');

        $('#editOrderId').val(orderId);
        $('#editNama').val(nama);
        $('#editTelepon').val(telepon);
        $('#editBerat').val(berat);
        $('input[name="edit_layanan"][value="' + layanan + '"]').prop('checked', true);
        $('input[name="edit_status"][value="' + status + '"]').prop('checked', true);
        
        $('#editModal, #editModalBackdrop').addClass('show');
    });

    $('#editForm').on('submit', function(event) {
        event.preventDefault();
        const formData = $(this).serialize() + '&action=edit_order';
        $.ajax({
            type: 'POST',
            url: 'process.php',
            data: formData,
            success: function(response) {
                $('#editModal, #editModalBackdrop').removeClass('show');
                loadOrders();
            }
        });
    });

    $('#cancelEdit, #editModalBackdrop').on('click', function() {
        $('#editModal, #editModalBackdrop').removeClass('show');
    });

});